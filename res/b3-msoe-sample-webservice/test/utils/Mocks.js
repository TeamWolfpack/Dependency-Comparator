var sinon = require("sinon");

var mockLogger = {
	getLogger: function(){
		return {
	        trace: sinon.stub(),
	        debug: sinon.stub(),
	        info: sinon.stub(),
	        warn: sinon.stub(),
	        error: sinon.stub(),
	        fatal: sinon.stub(),
	        setLevel: sinon.stub()
	    };
	}
};

var openCircuitBreakerFactory = function() {
    return {
        run: function() {
            return Promise.reject(new Error("Circuit Breaker Open"));
        }
    };
};

var closedCircuitBreakerFactory = function() {
    return {
        run: function(command) {
            return command();
        }
    };
};

var getMockCoreRetryCommandSucceeds = function() {
    return {
        executeCommand: function(command) {
            return command();
        }
    };
};

var getMockCoreRetryCommandFails = function() {
    return {
        executeCommand: function() {
            return Promise.reject(new Error("I am simulating core retry failing"));
        }
    };
};

module.exports = {
	mockLogger: mockLogger,
	openCircuitBreakerFactory: openCircuitBreakerFactory,
	closedCircuitBreakerFactory: closedCircuitBreakerFactory,
	getMockCoreRetryCommandSucceeds: getMockCoreRetryCommandSucceeds,
	getMockCoreRetryCommandFails: getMockCoreRetryCommandFails
};
