#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CodePipelineStack} from "../lib/code_pipeline/code_pipeline-stack";

const app = new cdk.App();
new CodePipelineStack(app, 'PipelineStack', {env: {account: '704868603297', region: 'eu-central-1'}})
