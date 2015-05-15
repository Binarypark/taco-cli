/// <reference path="../typings/node.d.ts" />

import assert = require ("assert");
var os = require("os");
import util = require ("util");

import resourceManager = require ("./resourceManager");
import utilResources = require ("./resources/resourceManager");
import utilHelper = require ("./utilHelper");

import ResourceManager = resourceManager.ResourceManager;
import UtilHelper = utilHelper.UtilHelper;

module TacoUtility {
    export class TacoError implements Error {
        private static ErrorCodeFixedWidth: string = "0000";

        private innerError: Error;

        public static DefaultErrorPrefix: string = "TACO";

        public errorCode: number;
        public message: string;
        public name: string; 

        /**
         * Begin logging stdout and stderr of a process to a log file
         *
         * @param {number} errorCode  error code for the error say 101
         * @param {string} message user friendly localized error message
         */
        constructor(errorCode: number, message: string, innerError?: Error) {
            this.errorCode = errorCode;
            this.message = message;
            this.name = null;
            this.innerError = innerError;
        }

        public static getError(errorToken: string, errorCode: number, resources: ResourceManager, ...optionalArgs: any[]): TacoError {
            var args: string[] = [];
            if (optionalArgs.length > 0) {
                args = UtilHelper.getOptionalArgsArrayFromFunctionCall(arguments, 3);
            }

            return TacoError.wrapError(null, errorToken, errorCode, resources, args);
        }

        public static wrapError(innerError: Error, errorToken: string, errorCode: number, resources: ResourceManager, ...optionalArgs: any[]): TacoError {
            var message: string = null; 
            if (optionalArgs.length > 0) {
                assert(errorToken, "We should have an error token if we intend to use args");
                var args: string[] = UtilHelper.getOptionalArgsArrayFromFunctionCall(arguments, 4);
                if (errorToken) {
                    message = resources.getString(errorToken, args);
                }
            } else {
                message = errorToken;
            }

            return new TacoError(errorCode, message, innerError);
        }

        public toString(): string {
            var innerErrorString: string = "";
            if (this.innerError) {
                var stack: string = (<any>this.innerError).stack;
                if (stack) {
                    innerErrorString = utilResources.getString("InnerErrorToString", stack);
                } else if (this.innerError.message) {
                    innerErrorString = utilResources.getString("InnerErrorToString", this.innerError.message);
                }
            }

            // Transforms 32 to say "0032" (for fixed width = 4)
            var errorCodeString: string = (TacoError.ErrorCodeFixedWidth + this.errorCode).slice(-TacoError.ErrorCodeFixedWidth.length);
            return util.format("%s%s: %s\n%s", TacoError.DefaultErrorPrefix, errorCodeString, this.message, innerErrorString);
        }
    }
}

export = TacoUtility;