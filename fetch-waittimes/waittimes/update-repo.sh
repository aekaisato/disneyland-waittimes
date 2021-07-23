#!/usr/bin/env bash

function update_repo {
	COMMIT_MSG="update waittimes - $(date)";
	git add .
	git commit -m "$COMMIT_MSG"
	git push
}

update_repo
