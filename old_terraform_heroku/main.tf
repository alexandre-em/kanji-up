provider "heroku" {}

resource "heroku_app" "kanjiupapi" {
  name   = "kanji-up-api"
  region = "eu"
}

resource "heroku_build" "kanjiupapi" {
  app = heroku_app.kanjiupapi.id

  source {
    path = "./back"
  }

  lifecycle {
    create_before_destroy = true
  }
}

