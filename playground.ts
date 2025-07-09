const email = {
  from: {
    name: "Alice",
    address: "alice@example.com",
    raw: "Alice <alice@example.com>",
  },
  to: [
    { name: "Bob", address: "bob@example.com", raw: "Bob <bob@example.com>" },
    {
      name: "Charlie",
      address: "charlie@example.com",
      raw: "Charlie <charlie@example.com>",
    },
  ],
  cc: [
    {
      name: "Alice A.",
      address: "alice@example.com",
      raw: "Alice A. <alice@example.com>",
    },
  ],
  bcc: [],
  replyTo: [],
};

const addressesToUpsert = new Map();
for (const address of [
  email.from,
  ...email.to,
  ...email.cc,
  ...email.bcc,
  ...email.replyTo,
]) {
  addressesToUpsert.set(address.address, address);
}

console.log(addressesToUpsert);
