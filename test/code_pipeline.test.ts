import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Template } from 'aws-cdk-lib/assertions';
import {getCodePostOrdersLambda} from "../code/lambda_code";
import {ApiStack} from "../lib/api/api-stack";
import {CodePipelineStack} from "../lib/code_pipeline/code_pipeline-stack";

test('Pipeline Has Expected Steps', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodePipelineStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
        Stages: [
            {"Name": "Source"},
            {"Name": "Build"},
            {"Name": "UpdatePipeline"},
            ]
    });
});
