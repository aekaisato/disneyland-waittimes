#!/usr/bin/env bash

function update_repo {
	COMMIT_MSG="update waittimes - $(date)";
	git add .
	git commit -m "$COMMIT_MSG"
	git push
}
export -f update_repo

# run once
# update_repo

# run everyday at 1am
# watch -n 86400 update_repo | at 0100

# run everday
watch -n 86400 update_repo

