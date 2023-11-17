import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines"
import {Construct} from "constructs";
import {stagedId} from "../util";

export class CodePipelineStack extends cdk.Stack {

    constructor(scope: Construct, id: string, stage: string, props: cdk.StackProps) {
        super(scope, stagedId(id, stage), props);

        const pipeline = new pipelines.CodePipeline(this, stagedId('EntrixChallengePipeline', stage), {
            pipelineName: stagedId('EntrixChallengePipeline', stage),
            synth: new pipelines.ShellStep('Synth', {
                input: pipelines.CodePipelineSource.gitHub('andreasstrack/entrix_challenge_solution', 'master', {
                    authentication: cdk.SecretValue.secretsManager('EntrixChallenge', {jsonField: 'github-token'}),
                }),
                commands: ['npm ci', 'npm test', 'npm run cdk synth']
            }),

        });
    }
}