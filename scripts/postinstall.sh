IJS_TOKEN=$(grep 'IJSToken' ./scripts/script.json | sed -r 's/^[^:]*:(.*)$/\1/' | tr -d '"' | tr -d ' ')
sed -i -- "s|$IJS_TOKEN|{IJS_TOKEN}|g" ./package.json