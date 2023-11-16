import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs";
import {stagedId} from "../util";
import {getCodePostOrdersLambda} from "../../code/lambda_code";

interface ResourceProps {
    path: string,
    method: string,
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stage: string, props: cdk.StackProps) {
        super(scope, stagedId(id, stage), props);

        const api = this.createApiGateway(stage.toLowerCase())
        const postOrdersLambda = this.createPostOrdersLambda();

        this.connectResource(api, postOrdersLambda, {
            path: 'orders',
            method: 'POST',
        })

        // Output the endpoint URL after deployment
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
        });
    }

    createApiGateway(stage: string) : apigateway.RestApi {
        const api = new apigateway.RestApi(this, 'Api', {
            deployOptions: {
                stageName: stage.toLowerCase()
            },
        });

        return api;
    }

    createPostOrdersLambda() : lambda.Function {
        const postLambda = new cdk.aws_lambda.Function(this, 'PostLambda', {
            runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
            handler: 'index.lambda_handler',
            code: cdk.aws_lambda.Code.fromInline(getCodePostOrdersLambda()),
        });
        postLambda.addEnvironment("DYNAMODB_TABLE_NAME", "MyDynamoDbTable");

        return postLambda;
    }

    connectResource(api: apigateway.RestApi, lambdaFunction: lambda.Function, props: ResourceProps) {
        const integration = new apigateway.LambdaIntegration(lambdaFunction);
        const resource = api.root.addResource(props.path);
        resource.addMethod(props.method, integration);
    }
}