// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import Zk from '@nuid/zk';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    const proof = JSON.parse(event.request.validationData.proof);

    if (!proof || !Zk.proofIsVerified(proof))
      throw "Invalid request"

    event.response.autoConfirmUser = true;
    (event.response as any).autoVerifyEmail = true;
    return event;
};
