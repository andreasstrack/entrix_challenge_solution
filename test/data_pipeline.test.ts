import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Template } from 'aws-cdk-lib/assertions';
import {DataPipelineStack} from "../lib/data_pipeline/data_pipeline-stack";
import {getCodeLambdaA, getCodeLambdaB} from "../code/lambda_code";
import assert = require("assert");
import {StateMachineStack} from "../lib/data_pipeline/state_machine-stack";

test('S3 Bucket Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DataPipelineStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: "order-results-dev"
    });
});

test('Lambda Functions Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DataPipelineStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
        Code: {"ZipFile": getCodeLambdaA()},
        Runtime: lambda.Runtime.PYTHON_3_10.toString(),
        Handler: 'index.lambda_handler',
    });
    template.hasResourceProperties('AWS::Lambda::Function', {
        Code: {"ZipFile": getCodeLambdaB()},
        Runtime: lambda.Runtime.PYTHON_3_10.toString(),
        Handler: 'index.lambda_handler',
    });
});

test('Lambda B Has S3 Access In Execution Role', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DataPipelineStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const resources = Template.fromStack(stack).findResources(
        "AWS::IAM::Role", {
        }
    );

    var lambdaBRoleFound = false;
    var s3PolicyFound = false;
    for (const [key, value] of Object.entries(resources)) {
        if (key.startsWith("LambdaB")) {
            lambdaBRoleFound = true;

            for (const managedPolicyArn of value['Properties']['ManagedPolicyArns']) {
                // Expecting this kind of object here:
                // {
                //     'Fn::Join': [ '', [ 'arn:', [Object], ':iam::aws:policy/AmazonS3FullAccess' ] ]
                // }
                const arnString = managedPolicyArn['Fn::Join'][1].join('')
                if (arnString.endsWith(":iam::aws:policy/AmazonS3FullAccess")) {
                    s3PolicyFound = true;
                }
            }
        }
    }

    assert(lambdaBRoleFound);
    assert(s3PolicyFound);
});

test('State Machine Is Scheduled', () => {
    const app = new cdk.App();
    // WHEN
    const dataPipelineStack = new DataPipelineStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    const stateMachineStack = dataPipelineStack.getStateMachineStack()
    // THEN
    const template = Template.fromStack(stateMachineStack);
    template.hasResourceProperties("AWS::Events::Rule", {
        ScheduleExpression: 'rate(1 hour)',
        State: 'ENABLED'
    })
});

