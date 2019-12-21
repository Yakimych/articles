using System;
using Xunit;

namespace CSharp.Example
{
    public class ApiCallResult
    {
        public ApiCallResult(bool isSuccess, int? returnedValue, string errorMessage)
        {
            if (isSuccess && returnedValue == null)
            {
                throw new ArgumentException($"{nameof(returnedValue)} should be set when {nameof(isSuccess)} is true");
            }

            if (!isSuccess && string.IsNullOrEmpty(errorMessage))
            {
                throw new ArgumentException($"{nameof(errorMessage)} should be set when {nameof(isSuccess)} is false");
            }

            if (isSuccess && !string.IsNullOrEmpty(errorMessage))
            {
                throw new ArgumentException($"{nameof(errorMessage)} cannot be set when {nameof(isSuccess)} is true");
            }

            if (!isSuccess && returnedValue != null)
            {
                throw new ArgumentException($"{nameof(returnedValue)} cannot be set when {nameof(isSuccess)} is false");
            }

            IsSuccess = isSuccess;
            ReturnedValue = returnedValue;
            ErrorMessage = errorMessage;
        }

        public bool IsSuccess { get; }
        public int? ReturnedValue { get; }
        public string ErrorMessage { get; }
    }

    public class SampleTests
    {
        [Fact]
        public void ApiCallResult_ThrowsException_When_IsSuccess_IsTrue_But_ReturnedValue_IsNull()
        {
            Assert.Throws<ArgumentException>(() =>
              new ApiCallResult(
                  isSuccess: true,
                  returnedValue: null,
                  errorMessage: "Error"));
        }

        [Fact]
        public void ApiCallResult_ThrowsException_When_IsSuccess_IsFalse_But_ErrorMessage_IsNull()
        {
            Assert.Throws<ArgumentException>(() =>
                new ApiCallResult(
                    isSuccess: false,
                    returnedValue: null,
                    errorMessage: null));
        }

        // But wait, we can still create an object in an invalid state!
        [Fact]
        public void ApiCallResult_ThrowsException_When_IsSuccess_IsTrue_But_ErrorMessage_InNotEmpty()
        {
            Assert.Throws<ArgumentException>(() =>
                new ApiCallResult(
                  isSuccess: true,
                  returnedValue: 12,
                  errorMessage: "An error has occurred"));
        }

        [Fact]
        public void ApiCallResult_ThrowsException_When_IsSuccess_IsFalse_But_ReturnedValue_IsNotNull()
        {
            Assert.Throws<ArgumentException>(() =>
                new ApiCallResult(
                  isSuccess: false,
                  returnedValue: 99,
                  errorMessage: null));
        }
    }
}
