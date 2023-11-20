import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import {Construct} from "constructs";
import {getCodeLambdaA, getCodeLambdaB} from "../../code/lambda_code";
import {StateMachineStack} from "./state_machine-stack";

export class DataPipelineStack extends cdk.Stack {

    stateMachineStack: StateMachineStack;

    constructor(scope: Construct, id: string, stage: string, props: cdk.StackProps) {
        super(scope, id, props);

        const orderResultsBucket = new cdk.aws_s3.Bucket(this, 'OrderResultsBucket-' + stage, {
            bucketName: 'order-results-' + stage.toLowerCase()
        });

        const lambdaA = new cdk.aws_lambda.Function(this, 'LambdaA', {
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
            handler: 'index.lambda_handler',
            code: cdk.aws_lambda.Code.fromInline(getCodeLambdaA()),
        });

        const s3PutAccessPolicy = new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    actions: ['s3:PutObject'],
                    effect: iam.Effect.ALLOW,
                    resources: [orderResultsBucket.bucketArn + '/*'],
                }),
            ],
        });

        const lambdaBExecutionRole = new iam.Role(
            this, 'LambdaBExecutionRole', {
                assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
                inlinePolicies: {"S3PutAccess": s3PutAccessPolicy}
            });

        const lambdaB = new cdk.aws_lambda.Function(this, 'LambdaB', {
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
            handler: 'index.lambda_handler',
            code: cdk.aws_lambda.Code.fromInline(getCodeLambdaB()),
            role: lambdaBExecutionRole
        });
        lambdaB.addEnvironment("LOG_BUCKET", orderResultsBucket.bucketName);

        this.stateMachineStack = new StateMachineStack(this, "StateMachine", stage, {
            lambdaA: lambdaA,
            lambdaB: lambdaB,
            stackProps: props
        });
    }

    getStateMachineStack(): StateMachineStack {
        return this.stateMachineStack;
    }
}