import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as EntrixChallenge from '../lib/entrix_challenge-stack';
import assert = require("assert");
import {createStagedStacks} from "../lib/staging";

test('S3 Bucket Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new EntrixChallenge.EntrixChallengeStack(
        app, 'MyTestStack', "Dev", {env: {account: '704868603297', region: 'eu-west-2'}});
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: "order-results-dev"
    });
});

test('S3 Bucket Created for all stages when Stage is undefined', () => {
    const app = new cdk.App();
    // WHEN
    const stacks = createStagedStacks(app,undefined);

    // THEN
    expect(stacks).toHaveLength( 3);
});
