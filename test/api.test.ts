import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Template } from 'aws-cdk-lib/assertions';
import {getCodePostOrdersLambda} from "../code/lambda_code";
import {ApiStack} from "../lib/api/api-stack";

test('Api Gateway Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ApiStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: "Api",
    });
});

test('Lambda Function Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ApiStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
        Code: {"ZipFile": getCodePostOrdersLambda()},
        Runtime: lambda.Runtime.PYTHON_3_10.toString(),
        Handler: 'index.lambda_handler',
        Environment: { Variables: { "DYNAMODB_TABLE_NAME": "MyDynamoDbTable" }},
    });
});

test('Orders Resource Configured', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ApiStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: 'orders',
    });
});

