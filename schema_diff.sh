git clone https://github.com/SENG499-S22-Company3/shared.git
sort schema.graphql | tr -d "[:blank:]" | grep -v '^#' | grep "\S" > c4schema.graphql
sort shared/graphql/schema.graphql | tr -d "[:blank:]" | grep -v '^#' | grep "\S" > c3schema.graphql
diff c3schema.graphql c4schema.graphql