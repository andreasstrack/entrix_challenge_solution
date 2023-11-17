import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {DataPipelineStack} from "../data_pipeline/data_pipeline-stack";
import {ApiStack} from "../api/api-stack";
import {DEFAULT_STAGE_NAME} from "./code_pipeline-stack";

export class DeploymentStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const stageName = props.stageName ?? process.env.STAGE ?? DEFAULT_STAGE_NAME;

        const dataPipelineStack = new DataPipelineStack(this, "DataPipeline", stageName, props);
        const apiStack = new ApiStack(this, "Api", stageName, props);
    }
}