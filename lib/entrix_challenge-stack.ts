import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {stagedId} from "./util";
import {DataPipelineStack} from "./data_pipeline/data_pipeline-stack";
import {ApiStack} from "./api/api-stack";
import {CodePipelineStack} from "./code_pipeline/code_pipeline-stack";

export class EntrixChallengeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stage: string, props: cdk.StackProps) {
        super(scope, stagedId(id, stage), props);

        const dataPipelineStack = new DataPipelineStack(this, "DataPipeline", stage, props);
        const apiStack = new ApiStack(this, "Api", stage, props);
        const codePipelineStack = new CodePipelineStack(this, "CodePipeline", stage, props);
    }
}
