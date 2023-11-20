import * as cdk from 'aws-cdk-lib';
import {Match, Template} from 'aws-cdk-lib/assertions';
import {CodePipelineStack} from "../lib/code_pipeline/code_pipeline-stack";

test('Pipeline Has Expected Steps', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodePipelineStack(
        app, 'MyTestStack', {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
        Stages: [
            {"Name": "Source"},
            {"Name": "Build"},
            {"Name": "UpdatePipeline"},
            {"Name": "Dev"},
            {"Name": "Staging"},
            {"Name": "Prod"},
        ]
    });
});

test('Tests Run in Pipeline', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodePipelineStack(
        app, 'MyTestStack', {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::CodeBuild::Project", {
            "Description": "Pipeline step MyTestStack/Pipeline/Build/Synth",
            "Source": {"BuildSpec": Match.stringLikeRegexp(".*npm test.*")}
        });
});