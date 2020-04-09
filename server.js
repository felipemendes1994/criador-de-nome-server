const { ApolloServer } = require('apollo-server');
const dns = require("dns");
const service = require("./service");

const typeDefs = `
    type Item {
        id: Int
        type: String
        description: String
    }

    type Domain {
        name: String
        checkout: String
        available: Boolean
        extension: String
    }

    input ItemInput {
        type: String
        description: String
    }

    type Query {
        items (type: String): [Item]
    }

    type Mutation {
        saveItem (item: ItemInput): Item
        deleteItem (id: Int): Boolean
        generateDomains: [Domain]
        generateDomain(name: String): [Domain]
    }

`;

const isDomainAvailable = function(url){
    return new Promise(function (resolve, reject){
        dns.resolve(url, function(error){
            if(error){
                resolve(true);
            }else{
               resolve(false);
            }
        });
    })
};

const resolvers = {
    Query: {
        async items(_, args) {
            return await service.getItemsByType(args.type);
        }
    },
    Mutation: {
        async saveItem(_, args) {
            const [newItem] = await service.saveItem(args.item);
            return newItem;
        },
        async deleteItem(_, args) {
            await service.deleteItem(args.id);
            // const item = items.find(item => item.id === id);
            // if(!item) return false;
            // items.splice(items.indexOf(item), 1);
            return true;
        },
        async generateDomains(){
            const domains = [];
            const items = await service.getItems();

			for(const prefix of items.filter(item => item.type === "prefix")){
				for(const sufix of items.filter(item => item.type === "sufix")){
					const name = prefix.description + sufix.description;
                    const checkout = `https://checkout.hostgator.com.br/?a=add&sld=${name.toLowerCase()}&tld=.com.br`;
                    const available = await isDomainAvailable(`${name}.com.br`);
					domains.push({
						name,
                        checkout,
                        available
					});
				}
            }
            return domains;
        },
        async generateDomain(_, args){
            const domains = [];
            const name = args.name;
            const extensions = [".com.br", ".com", ".net", ".org"];

            for(const extension of extensions){
                const checkout = `https://checkout.hostgator.com.br/?a=add&sld=${name.toLowerCase()}&tld=${extension}`;
                const available = await isDomainAvailable(`${name}.com.br${extension}`);
                domains.push({
                    name,
                    checkout,
                    available,
                    extension
                });
            };

            return domains;
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers});
server.listen(4000, () => console.log('Server listening to port 4000'));