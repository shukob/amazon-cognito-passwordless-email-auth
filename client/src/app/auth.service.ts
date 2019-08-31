// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Auth } from 'aws-amplify';
import { CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import Zk from '@nuid/zk';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private cognitoUser: CognitoUser & { challengeParam: { email: string, challenge: string } };

  // Get access to window object in the Angular way
  private window: Window;
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView;
  }

  public async signIn(email: string) {
    this.cognitoUser = await Auth.signIn(email);
  }

  public async signOut() {
    await Auth.signOut();
  }

  public async answerCustomChallenge(proof: object) {
    this.cognitoUser = await Auth.sendCustomChallengeAnswer(this.cognitoUser, JSON.stringify(proof));
    return this.isAuthenticated();
  }

  public async getPublicChallengeParameters() {
    return this.cognitoUser.challengeParam;
  }

  public async signUp(email: string, fullName: string, password: string) {
    const proof = Zk.proofFromSecret(password);
    const credential = Zk.credentialFromProof(proof);
    const params = {
      username: email,
      password: this.getRandomString(30),
      attributes: {
        name: fullName,
        'custom:credential': JSON.stringify(credential)
      },
      validationData: [
        new CognitoUserAttribute({
          Name: 'proof',
          Value: JSON.stringify(proof)
        })
      ]
    };
    await Auth.signUp(params);
  }

  public async getChallenge() {
    const { challenge } = await this.getPublicChallengeParameters();
    return JSON.parse(challenge);
  }

  public async logIn(email: string, password: string) {
    await this.signIn(email);
    const challenge = await this.getChallenge();
    const proof = Zk.proofFromSecret(challenge, password);
    return await this.answerCustomChallenge(proof);
  }

  private getRandomString(bytes: number) {
    const randomValues = new Uint8Array(bytes);
    this.window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(this.intToHex).join('');
  }

  private intToHex(nr: number) {
    return nr.toString(16).padStart(2, '0');
  }

  public async isAuthenticated() {
    try {
      await Auth.currentSession();
      return true;
    } catch {
      return false;
    }
  }

  public async getUserDetails() {
    if (!this.cognitoUser) {
      this.cognitoUser = await Auth.currentAuthenticatedUser();
    }
    return await Auth.userAttributes(this.cognitoUser);
  }

}
