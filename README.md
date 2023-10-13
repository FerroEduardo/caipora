<div align="center">
  <h1>Caipora</h1>
</div>

This repository serves as a demonstration of the concept of **automating code execution and testing** through the utilization of **pull requests and GitHub Actions**.

## How it works?

When a user creates a pull request that contains a challenge solution, the [pipeline](.github/workflows/evaluate.yml) evaluates to see if commit is valid and then runs some tests using the user code using [GodBolt API](https://github.com/compiler-explorer/compiler-explorer/blob/main/docs/API.md).

If the commit is valid, it also sets a label with the language name for better usage for the maintainers.

### How the commit is considered valid?

The pipeline checks if only one challenge was sent and if there is any compatible code file. The compatibility is totally dependent on GodBolt, so not all languages are compatible (most known are available). The available languages/compilers can be found [here](https://godbolt.org/api/compilers).

The languages/compilers compatible with this repository are hardcoded at [types.ts](/.code-runner/src/types.ts).

### Where about the challenges?

Each challenge is defined inside the `challenges/` directory, and each challenge must have at least one test. Tests are located at `.tests`, and each directory inside this folder is considered a test. Each test must have a `stdin.txt` and `stdout.txt` files that are used as input and output comparison, respectively.

Example of file structure:
```
challenges/
├── 01-hello-world
│   ├── README.md
│   └── .tests
│       └── first
│           ├── stdin.txt
│           └── stdout.txt
├── 02-fibonacci
│   ├── README.md
│   └── .tests
│       ├── first
│       │   ├── stdin.txt
│       │   └── stdout.txt
│       └── second
│           ├── stdin.txt
│           └── stdout.txt
└── README.md
```

#### User challenges

When a user sends a challenge for evaluation, they should create a directory inside the challenge folder named with the username.

Example of file structure:
```
challenges/
├── 01-hello-world
│   ├── .tests
│   │   └── first
│   │       ├── stdin.txt
│   │       └── stdout.txt
│   ├── ferroeduardo
│   │   ├── Program.java
│   │   └── README.md
│   └── README.md
└── README.md
```

If there are any errors in the commit, the pipeline will issue warnings by sending comments, setting labels, and failing the pipeline job

#### Execution reports

Reports are sent after the tests execution and show the successes, failures, and other details. See the following examples:

```md
# Report
## Successes:
- first
## Failures:

------
## Summary:
Successes: 1
Failures: 0
Total: 1
```

```md
# Report
## Successes:

## Failures:
- first
  - Expected: "hello world"
  - Actual: "Hello, World!"
  - stdin: ""

------
## Summary:
Successes: 0
Failures: 1
Total: 1
```