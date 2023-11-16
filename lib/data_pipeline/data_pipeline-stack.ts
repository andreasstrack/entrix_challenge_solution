import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {stagedId} from "../util";
import {getCodeLambdaA, getCodeLambdaB} from "../../code/lambda_code";
import {StateMachineStack} from "./state_machine-stack";

export class DataPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stage: string, props: cdk.StackProps) {
        super(scope, stagedId(id, stage), props);

        const orderResultsBucket = new cdk.aws_s3.Bucket(this, stagedId('OrderResultsBucket', stage), {
                bucketName: stagedId("order-results", stage.toLowerCase()),
            }
        )

        const lambdaA = new cdk.aws_lambda.Function(this, stagedId('LambdaA', stage), {
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
            handler: 'index.lambda_handler',
            code: cdk.aws_lambda.Code.fromInline(getCodeLambdaA()),
        });

        const lambdaBExecutionRole = new cdk.aws_iam.Role(
            this, stagedId('LambdaBExecutionRole', stage), {
                assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
                // TODO: Restrict S3 access
                managedPolicies: [cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")]
            });


        const lambdaB = new cdk.aws_lambda.Function(this, stagedId('LambdaB', stage), {
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
            handler: 'index.lambda_handler',
            code: cdk.aws_lambda.Code.fromInline(getCodeLambdaB()),
            role: lambdaBExecutionRole
        });
        lambdaB.addEnvironment("LOG_BUCKET", orderResultsBucket.bucketName);

        const stateMachine = new StateMachineStack(this, "StateMachine", stage, {
            lambdaA: lambdaA,
            lambdaB: lambdaB,
            stackProps: props
        });
    }
}