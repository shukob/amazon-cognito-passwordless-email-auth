// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import Zk from '@nuid/zk';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    const proof = JSON.parse(event.request.challengeAnswer);
    if (Zk.proofIsVerified(proof)) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }
    return event;
};
