---
sidebar_position: 2
title: GitOps on Amazon EKS
description: How Terraform, GitHub Actions and Argo CD fit together to deploy a microservices app to EKS with Git as the source of truth.
---

# GitOps on Amazon EKS

This walk-through covers my [EKS GitOps project](https://github.com/alok-xavier/EKS-GitOps-DevOps-Project). It deploys the [OpenTelemetry demo shop](https://opentelemetry.io/docs/demo/), a set of microservices, to Amazon EKS. The whole path from cluster to running image is declared in Git.

## The shape of it

```text
 Terraform ──▶ EKS cluster ◀── Argo CD ◀── manifests in Git
                                               ▲
 Pull request ──▶ GitHub Actions ──▶ new tag ──┘
```

There are four stages. Each one hands off to the next through Git or a registry, never by hand.

## 1. Terraform provisions the platform

The infrastructure lives in `eks terraform install/eks-install` as two reusable modules:

- **`vpc`** creates the network: a `/16` VPC with public and private subnets across three availability zones.
- **`eks`** creates the cluster IAM role, the EKS control plane and a managed node group. Nodes get the standard worker, CNI and ECR read-only policies.

The root module wires them together. The cluster goes in the private subnets:

```hcl
module "eks" {
  source = "./modules/eks"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_groups     = var.node_groups
}
```

### Remote state

State is not kept on a laptop. A separate `backend` configuration creates an S3 bucket with versioning and encryption, plus a DynamoDB table for state locking. The main configuration then points at it:

```hcl
backend "s3" {
  bucket         = "demos-terraform-eks-state-s3-bucket"
  key            = "terraform.tfstate"
  region         = "us-west-2"
  dynamodb_table = "terraform-eks-state-locks"
  encrypt        = true
}
```

Versioning lets you recover an older state file if one is corrupted. The lock stops two `terraform apply` runs from writing at the same time.

## 2. GitHub Actions builds and tests

The CI workflow runs on every pull request to `main`, with jobs that depend on one another:

1. **build**: compile the service and run its unit tests.
2. **code-quality**: run `golangci-lint`. This job runs in parallel with the build.
3. **docker**: after a successful build, build the image and push it, tagged with the workflow's run ID.
4. **updatek8s**: write the new tag into the service's Kubernetes manifest and commit it back to the repository.

Tagging with the run ID instead of `latest` means every image can be traced back to the exact pipeline run that built it.

## 3. Git holds the desired state

The `kubernetes manifests` folder has a Deployment and a Service for each microservice. When CI commits a new image tag, that commit is the deployment request. It is reviewable and auditable, and it can be reverted like any other change.

## 4. Argo CD reconciles the cluster

Argo CD runs inside the cluster and watches the manifests folder. When the manifests in Git differ from what is running, it applies the difference. CI never needs credentials for the cluster. The cluster pulls its own changes.

## Why this design

- **One source of truth.** The question "what should be running?" is answered by the Git history, not by whoever last ran `kubectl`.
- **Smaller blast radius for CI.** The pipeline only pushes images and commits. It never talks to the Kubernetes API.
- **Easy rollback.** Reverting the tag commit rolls the service back.

## What's next

- Canary releases with a service mesh such as Istio.
- Wiring the demo's OpenTelemetry signals into a proper observability stack.
