import React from 'react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to Fairlanche!
        </h1>
        <p className="mt-3 text-2xl">
          A decentralized application for deploying Avalanche subnets and distributing its resources with fair algorithms
        </p>
        <div className="flex flex-wrap justify-around max-w-4xl mt-6 sm:w-full">
          <a
            href="/transact"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-red-600 focus:text-red-600"
          >
            <h3 className="text-2xl font-bold">Transact &rarr;</h3>
            <p className="mt-4 text-xl">
              Interact with the blockchains that you are a member of
            </p>
          </a>
          <a
            href="/deploy"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-red-600 focus:text-red-600"
          >
            <h3 className="text-2xl font-bold">Deploy &rarr;</h3>
            <p className="mt-4 text-xl">
              Deploy your own customized subnets and blockchains
            </p>
          </a>
          <a
            href="/manage"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-red-600 focus:text-red-600"
          >
            <h3 className="text-2xl font-bold">Manage &rarr;</h3>
            <p className="mt-4 text-xl">
              Manage your subnets and deploy additional resource distribution contracts
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}

export default Home;