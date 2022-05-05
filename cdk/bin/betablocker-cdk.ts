#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BetablockerCdkStack } from '../lib/betablocker-cdk-stack';

const app = new cdk.App();
new BetablockerCdkStack(app, 'BetablockerCdkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});