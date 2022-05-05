#!/usr/bin/env node
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
//import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';




export class BetablockerCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //configuration
    const websiteProjectName = "betablocker-test"




    //start with preprod environment
    const preprodIdentifier = websiteProjectName + "-preprod"

    const preprodCloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'PreprodCloudFrontOAI', {
      comment: `OAI for ${preprodIdentifier}`
    });

    const preprodSiteBucket = new s3.Bucket(this, 'PreprodSiteBucket', {
      bucketName: preprodIdentifier,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    preprodSiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [preprodSiteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(preprodCloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    const preprodDistribution = new cloudfront.CloudFrontWebDistribution(this, 'PreprodDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: preprodSiteBucket,
            originAccessIdentity: preprodCloudfrontOAI

          },
          behaviors: [{
            isDefaultBehavior: true,
            compress: true,
            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
          }]
        }
      ]
    });
    new CfnOutput(this, 'PreprodDistributionId', { value: preprodDistribution.distributionId });
    new CfnOutput(this, 'PreprodDistributionDomain', { value: preprodDistribution.distributionDomainName });










    //continuing with prod environment
    const prodIdentifier = websiteProjectName + "-prod"

    const prodCloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'ProdCloudFrontOAI', {
      comment: `OAI for ${prodIdentifier}`
    });

    const prodSiteBucket = new s3.Bucket(this, 'ProdSiteBucket', {
      bucketName: prodIdentifier,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    prodSiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [prodSiteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(prodCloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    const prodDistribution = new cloudfront.CloudFrontWebDistribution(this, 'ProdDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: prodSiteBucket,
            originAccessIdentity: prodCloudfrontOAI

          },
          behaviors: [{
            isDefaultBehavior: true,
            compress: true,
            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
          }]
        }
      ]
    });
    new CfnOutput(this, 'ProdDistributionId', { value: preprodDistribution.distributionId });
    new CfnOutput(this, 'ProdDistributionDomain', { value: prodDistribution.distributionDomainName });
  }
}
