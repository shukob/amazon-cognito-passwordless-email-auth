// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import Zk from '@nuid/zk';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    const credential = JSON.parse(event.request.userAttributes['custom:credential']);
    const challenge = Zk.challengeFromCredential(credential);

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
      email: event.request.userAttributes.email,
      challenge: JSON.stringify(challenge)
    };

    return event;
};
