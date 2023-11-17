import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines"
import {Construct} from "constructs";
import {DeploymentStage} from "./DeploymentStage";

const stageConfigurations = [
    // These would normally have different AWS accounts to separate stages completely.
    {stageName: "Dev", manualApproval: false, stackProps: {env: {account: '704868603297', region: 'eu-central-1'}}},
    {stageName: "Staging", manualApproval: true, stackProps: {env: {account: '704868603297', region: 'eu-west-1'}}},
    // {stageName: "Prod", manualApproval: true, stackProps: {env: {account: '704868603297', region: 'eu-west-2'}}}
];

export const DEFAULT_STAGE_NAME = stageConfigurations[0].stageName;

export class CodePipelineStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new pipelines.CodePipeline(this, 'EntrixChallengePipeline', {
            pipelineName: 'EntrixChallengePipeline',
            synth: new pipelines.ShellStep('Synth', {
                input: pipelines.CodePipelineSource.gitHub('andreasstrack/entrix_challenge_solution', 'master', {
                    authentication: cdk.SecretValue.secretsManager('EntrixChallenge', {jsonField: 'github-token'}),
                }),
                commands: ['npm ci', 'npm test', 'npm run cdk synth']
            }),
        });

        stageConfigurations.forEach(stageConfig => {
            const stage = pipeline.addStage(
                new DeploymentStage(pipeline, stageConfig.stageName, {
                    env: stageConfig.stackProps.env,
                    stageName: stageConfig.stageName
                }));

            if (stageConfig.manualApproval) {
                stage.addPre(new pipelines.ManualApprovalStep('approval'))
            }
        });
    }
}