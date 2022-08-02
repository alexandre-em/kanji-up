terraform {
  required_providers {
    heroku = {
      source  = "heroku/heroku"
      version = "~> 4.6.0"
    }
  }

  required_version = ">= 0.14"

  cloud {
    organization = "emalex"

    workspaces {
      name = "gh-kanji-up-api-actions"
    }
  }
}

