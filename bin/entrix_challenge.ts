#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CodePipelineStack, stageConfigurations} from "../lib/code_pipeline/code_pipeline-stack";

const app = new cdk.App();
new CodePipelineStack(app, 'PipelineStack', {env: stageConfigurations[0].stackProps.env})
