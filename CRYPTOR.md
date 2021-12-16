# Ferrum Crypto Tools


## How to securely get a private key on a virtual machine

1) Get a private and public key pairs (for ferrum totp API) from the team
2) Create an AWS user account, and an AWS KMS key. Make sure your user account has access to decrypt / encrypt data using the key
3) Set up environment variable in a an env file
4) Run the command

```
$ docker run --env-file <ENV_FILE> -ti --rm ferrum-aws-lambda-helper-cryptor:0.1.0 privateKey --two-fa-id <YOUR_2fa_ID> --two-fa <YOUR_2fa_TOKEN>
```



Run the following commands to get the list of environment variables required.


```

$ docker run --env-file ./test-file.env -ti --rm ferrum-aws-lambda-helper-cryptor:0.1.0 print-config-template

```

