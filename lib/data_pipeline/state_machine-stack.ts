import * as cdk from "aws-cdk-lib";
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib";

interface StepFunctionProps {
    lambdaA: lambda.Function,
    lambdaB: lambda.Function,
    stackProps: cdk.StackProps,
}

export class StateMachineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stage: string, props: StepFunctionProps) {
        super(scope, id, props.stackProps);

        const definition = this.buildDefinition(stage, props);

        const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definitionBody: sfn.DefinitionBody.fromChainable(definition),
            timeout: cdk.Duration.seconds(20),
        });

        this.scheduleStateMachine(stateMachine, Duration.days(1));
    }

    scheduleStateMachine(stateMachine: sfn.StateMachine, duration: Duration) {
        const rule = new events.Rule(this, 'StateMachineRule', {
            schedule: events.Schedule.rate(duration),
        });
        rule.addTarget(new targets.SfnStateMachine(stateMachine));
    }

    buildDefinition(stage: string, props: StepFunctionProps): sfn.IChainable {
        const invokeLambdaA = new tasks.LambdaInvoke(this, 'InvokeLambdaA', {
            lambdaFunction: props.lambdaA,
        });

        const invokeLambdaB = new tasks.LambdaInvoke(this, 'InvokeLambdaB', {
            lambdaFunction: props.lambdaB,
        });

        const mapOrders = new sfn.Map(this, 'MapOrders', {
            itemsPath: sfn.JsonPath.stringAt('$.Payload.orders'),
        });

        const notifyOnFailure = this.buildFailureNotification()

        const handleResultAvailability = new sfn.Choice(this, 'CheckResultAvailable', {})
            .when(sfn.Condition.booleanEquals('$.Payload.results', true),
                mapOrders
                    .iterator(invokeLambdaB
                        .addCatch(notifyOnFailure)))
            .otherwise(invokeLambdaA);

        return sfn.Chain
            .start(invokeLambdaA)
            .next(handleResultAvailability);
    }

    buildFailureNotification(): tasks.SnsPublish {
        const snsTopic = new sns.Topic(this, "Data Processing Error");
        const snsTopicSubscription = new subs.EmailSubscription('herrstrack@gmail.com');
        snsTopic.addSubscription(snsTopicSubscription);
        return new tasks.SnsPublish(this, 'NotifyOnFailure', {
            topic: snsTopic,
            message: sfn.TaskInput.fromJsonPathAt('$.Cause'),
            resultPath: '$.sns',
        });

    }
}
