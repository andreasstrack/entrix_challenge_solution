# My Solution to the Entrix Case Challenge

## Anatomy of the Code

The code features three major CDK stacks to implement the three major requirements of the challenge.

### `CodePipelineStack`

This stack holds the configuration of the AWS CodePipeline for CI/CD of this package. The instantiation happens 
in the CDK entry point `bin/entrix_challenge.ts`, which gets executed when executing `cdk [synth|deploy]`. 

In addition to the standard stages `Source`, `Build`, and `UpdatePipeline`, it holds the three application stages 
`Dev`, `Staging`, and `Prod`. Those deploy the two other major stacks in their configured environment (AWS account / 
region pair). Note that for reasons of simplicity within the challenge all stages get deployed to the same AWS account.
It is AWS best practice is to also have different accounts for different stage in order to limit blast radius in case
of an incident.

The `CodePipeline` itself gets instantiated in the same account / region as the first application stage, `Dev`. 

The pipeline is connected with the GitHub account holding the solution and gets triggered upon a merge to `master`.

### `DataPipelineStack`

This stack holds everything that is necessary to execute the data pipeline as specified. The two functions `LambdaA`
and `LambdaB` get integrated into a State Machine of AWS StepFunctions. The state machine ...
* ... gets triggered on schedule.
* ... repeats execution of `LambdaA` until results are available.
* ... maps the order array output of `LambdaA` and executes `LambdaB` once for each received order. Any error in
  the execution of `LambdaB` will get caught and sent to an SNS topic, which is connected to an email delivery.

The stack also creates the S3 bucket to store the results of `LambdaB`.

### `ApiStack`

This stack holds the API Gateway for posting orders as well as the `PostLambda` to process incoming orders. The 
Lambda function powers a REST resource with path "orders".

## Testing

There is one test suite for each major component described above. The tests get executed in the `Build` step of the
pipeline.

## Tools
The `bin/` directory contains two helper scripts:

### testApiEndpoint.sh 

Usage: `testApiEndpoint.sh <URL w/o Path>`

Example:
```
./bin/testApiEndpoint.sh https://i1qd43vqij.execute-api.eu-west-2.amazonaws.com/prod 
Sending test event to https://i1qd43vqij.execute-api.eu-west-2.amazonaws.com/prod/orders
201% 
```

### testGitHubAuthentication.sh

Usage: `testGitHubAuthentication <access token>`

Example:
```                               
./bin/testGitHubAuthentication.sh XXXXXXXXXXXXXXXXXXXXXXXXXX 
{
  "login": ...
   ...
}
200%                                                 
```

If we will be verifying my solution on an AWS account of yours, I will need to provide a new access token for it. In case
we can verify on my personal account that I have been using, there is nothing to be done.

## Appendix

### Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

### Bootstrapping
* Create a user with AWSCloudFormationFull access privileges.
