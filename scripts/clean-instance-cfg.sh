#!/bin/sh
# git clean filter for instance.cfg -- see .gitattributes and README ("Committing").
#
# instance.cfg mixes three kinds of content:
#
#   1. pack settings that belong in the repo  -- memory, JVM args, icon, name
#   2. counters Prism rewrites on every launch -- lastLaunchTime, lastTimePlayed,
#      totalTimePlayed, and the [UI] section's serialised column widths
#   3. this machine's Java install           -- JavaPath and the probe results cached
#      beside it, all absolute paths under C:/Users/<name>/
#
# (2) made every commit carry unrelated churn. (3) was worse: the README tells people to
# clone into their own instances/ folder, and OverrideJavaLocation=true plus a JavaPath
# that only exists here means Prism starts them on a Java that isn't there. Prism picks a
# suitable runtime by itself when the override is off, so the committed copy turns it off.
#
# This runs on the way *into* git only. The working copy is never touched, so Prism keeps
# its own paths and counters locally.

sed -E \
    -e '/^(lastLaunchTime|lastTimePlayed|totalTimePlayed)=/d' \
    -e '/^(JavaPath|JavaSignature|JavaVendor|JavaVersion|JavaArchitecture|JavaRealArchitecture)=/d' \
    -e 's/^OverrideJavaLocation=true$/OverrideJavaLocation=false/' \
    -e '/^\[UI\]$/,$d'
