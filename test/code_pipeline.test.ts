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

test('Dev and Staging Have Manual Approval in Post Step', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodePipelineStack(
        app, 'MyTestStack', {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
        Stages: Match.arrayWith([
            Match.objectLike({
                "Name": "Dev",
                "Actions": Match.arrayWith([Match.objectLike({
                    "ActionTypeId": {"Category": "Approval"},
                    "RunOrder": findHighestRunOrderInPipelineStage(template, "Dev"),
                })])
            }),
            Match.objectLike({
                "Name": "Staging",
                "Actions": Match.arrayWith([Match.objectLike({
                    "ActionTypeId": {"Category": "Approval"},
                    "RunOrder": findHighestRunOrderInPipelineStage(template, "Staging"),
                })])
            })
        ])
    });
})

function findHighestRunOrderInPipelineStage(template: Template, stageName: string): number {
    template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
    const theStages = Object.values(template.findResources('AWS::CodePipeline::Pipeline'))[0]["Properties"]["Stages"];
    const theStage = findStageWithName(stageName, theStages);

    return findHighestRunOrderInActions(theStage["Actions"]);
}

function findStageWithName(stageName: string, stages: any[]) {
    return stages.find(stage => stage["Name"] === stageName);
}

function findHighestRunOrderInActions(actions: any[]): number {
    return actions.map(action => action["RunOrder"])
        .reduce((e1, e2) => Math.max(e1, e2))
}
