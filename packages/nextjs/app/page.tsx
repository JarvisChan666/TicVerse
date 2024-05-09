"use client";

import { useState } from "react";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, Balance } from "~~/components/scaffold-eth";
import {
  useAccountBalance,
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

export const GET_MESSAGES = gql`
  query MyQuery {
    messages(first: 10, orderDirection: desc, orderBy: createdAt) {
      message
      _to {
        id
      }
      _from {
        id
      }
    }
  }
`;

const Home: NextPage = () => {
  // need two states and also the useScaffoldContractWrite() hook with the needed arguments.
  const [newReceiver, setNewReceiver] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const { address: connectedAddress } = useAccount();
  //  use useAccount() from wagmi to get what we need and display it with Address and Balance from Scaffold-ETH components.
  const { address } = useAccount();

  // get the data from Scaffold-ETH hooks.
  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });
  // fill this(yourContract?.address) data using useDeployedContractInfo() from the hooks.
  const { data: yourContract } = useDeployedContractInfo("YourContract");

  const [newGreeting, setNewGreeting] = useState("");

  // use react state to keep track of what we type along with a useScaffoldContractWrite() hook.
  const { writeAsync: setGreeting } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "setGreeting",
    args: [newGreeting],
  });

  const { writeAsync: sendMessage } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "sendMessage",
    args: [newReceiver, newMessage],
  });

  const { loading, error, data: messagesData } = useQuery(GET_MESSAGES);

  const messages = messagesData?.messages || [];

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
      <div className="p-5 font-black text-xl">{greeting}</div>
        <div>
          <Address address={address} />
          <Balance address={address} />
        </div>
        {/* get our contracts address and balance. */}
        <div>
          <Address address={yourContract?.address} />
          <Balance address={yourContract?.address} />
        </div>
        {/* we need an input field and button to update our greeting using setGreeting... */}
        <div className="p-5">
          <input
            value={newGreeting}
            placeholder="Type here"
            className="input"
            onChange={(e) => setNewGreeting(e.target.value)}
          />
        </div>
        <div className="p-5">
          <button className="btn btn-primary" onClick={setGreeting}>
            Set Greeting
          </button>
        </div>
        {/* add the message receipient and message field with a button. */}
        <div className="p-5">
        <AddressInput
            value={newReceiver}
            placeholder="Recepient?"
            name={address}
            onChange={setNewReceiver}
          />
        </div>
        <div className="p-5">
          <input
            value={newMessage}
            placeholder="Message"
            className="input"
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </div>
        <div className="p-5">
          <button className="btn btn-primary" onClick={sendMessage}>
            Send Message
          </button>
        </div>
        <h1>Messages</h1>
        <table className="min-w-[70%]">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id}>
                <td>{message._from.id}</td>
                <td>{message._to.id}</td>
                <td>{message.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
