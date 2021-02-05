import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { validateStacksAddress } from '@stacks/transactions';
import { Flex, Box, Text, Input } from '@blockstack/ui';

const hex_to_ascii = str1 => {
  const hex = str1.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

const dev = process.env.NODE_ENV === 'development'

const network = dev ? 'testnet' : 'mainnet';
const address = dev ? 'ST21T5JFBQQPYQNQJRKYYJGQHW4A12G5ENBBA9WS7' : 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ'
const contractName= dev ? 'cartman-stacking-consultancy-3' :'cartman-stacking-consulting'
const fetchIfCanStack = async stxAddress => {
    const contractResult = await fetch(
      `https://stacks-node-api.${network}.stacks.co/v2/contracts/call-read/` +
        `${address}/${contractName}/cartman-can-i-stack`,
      {
        method: 'POST',
        body: JSON.stringify({
          sender: stxAddress,
          arguments: [],
        }),
        headers: {
          'content-type': 'application/json',
        },
      }
    )
      .then(res => res.json())
      .then(res => res.result);
    return hex_to_ascii(contractResult.slice(12));
};

const StackingResult = () => {
  const [result, setResult] = useState('');
  const [stxAddress, setStxAddress] = useState('');
  const isValidAddress = useMemo(() => stxAddress && validateStacksAddress(stxAddress), [
    stxAddress,
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const handleChange = useCallback(e => {
    setStxAddress(e.target.value);
  }, []);

  useEffect(() => {
    if (isValidAddress) {
      fetchIfCanStack(stxAddress).then(result => {
        setResult(result);
        setIsLoading(false);
      });
    }
  }, [stxAddress, isValidAddress]);
  const canStack = result === 'Yes you can';
  const image = canStack ? '/cartman-fu.jpeg' : '/eric-yo-mama.jpg';
  return (
    <Flex>
      <Box maxWidth="660px" width="100%" mx="auto" mt="75px">
        <Flex width="100%" flexWrap="wrap">
          <Box mb={4} width="100%">
            <Input
              placeholder="Enter your stacks address here"
              onChange={handleChange}
              value={stxAddress}
            />
            {stxAddress && !isValidAddress && <Text color="red" textStyle="caption">Invalid address</Text>}
          </Box>
          {isValidAddress && !isLoading && (
            <>
              <Box mb={4} width="100%">
                <img src={image} alt="" />
              </Box>
              <Box mb={4} width="100%">
                <Text textStyle="display.large" fontSize={7}>
                  {canStack ? 'Go f... I mean go get bitcoin!' : result}
                </Text>
              </Box>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default StackingResult;
