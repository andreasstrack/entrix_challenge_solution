#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {createStagedStacks} from "../lib/staging";

const app = new cdk.App();
createStagedStacks(app, process.env.STAGE);


