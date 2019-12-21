using System;
using Xunit;

namespace CSharp.Example
{
    public class SmarterApiCallResult
    {
        public static SmarterApiCallResult CreateSuccessResult(int returnedValue)
        {
            return new SmarterApiCallResult(returnedValue);
        }

        public static SmarterApiCallResult CreateErrorResult(string errorMessage)
        {
            return new SmarterApiCallResult(errorMessage);
        }

        private SmarterApiCallResult(int returnedValue)
        {
            IsSuccess = true;
            ReturnedValue = returnedValue;
        }

        private SmarterApiCallResult(string errorMessage)
        {
            if (string.IsNullOrEmpty(errorMessage))
            {
                throw new ArgumentException($"{nameof(errorMessage)} cannot be null");
            }

            IsSuccess = false;
            ErrorMessage = errorMessage;
        }

        public bool IsSuccess { get; }
        public int? ReturnedValue { get; }
        public string ErrorMessage { get; }
    }

    public class SmarterSampleTests
    {
        [Fact]
        public void ErrorMessage_IsEmpty_OnSuccessResult()
        {
            var successResult = SmarterApiCallResult.CreateSuccessResult(123);
            Assert.True(string.IsNullOrEmpty(successResult.ErrorMessage));
        }

        [Fact]
        public void ReturnedValue_IsEmpty_OnErrorResult()
        {
            var errorResult = SmarterApiCallResult.CreateErrorResult("An error has occurred");
            Assert.False(errorResult.ReturnedValue.HasValue);
        }

        [Fact]
        public void ErrorMessage_CannotBeEmpty_OnErrorResult()
        {
            Assert.Throws<ArgumentException>(() => SmarterApiCallResult.CreateErrorResult(null));
        }
    }
}
