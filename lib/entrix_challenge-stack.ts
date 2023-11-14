import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {stagedId} from "./util";

export class EntrixChallengeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stage: string, props?: cdk.StackProps) {
        super(scope, stagedId(id, stage), props);

        const bucket = new cdk.aws_s3.Bucket(this, stagedId('OrderResultsBucket', stage), {
                bucketName: stagedId("order-results", stage.toLowerCase()),
            }
        )
    }
}
