import * as cdk from "aws-cdk-lib";
import {EntrixChallengeStack} from "./entrix_challenge-stack";
import {App} from "aws-cdk-lib";

export function createStagedStacks(app: App, current_stage: string | undefined) : (cdk.Stack | undefined)[] {
    const stageConfigurations = [
        // These would normally have different AWS accounts to separate stages completely.
        {stage: "Dev", stackProps: {env: {account: '704868603297', region: 'eu-central-1'}}},
        {stage: "Staging", stackProps: {env: {account: '704868603297', region: 'eu-west-1'}}},
        {stage: "Prod", stackProps: {env: {account: '704868603297', region: 'eu-west-2'}}}
    ];

    return stageConfigurations.map(stageConfig => {
        if (current_stage === undefined || stageConfig.stage === current_stage) {
            return new EntrixChallengeStack(app, 'EntrixChallengeStack', stageConfig.stage, stageConfig.stackProps)
        }

        return undefined
    }).filter(stack => stack != undefined);
}
