/**
 * @param {org.example.mynetwork.Close} Close - the Close transaction
 * @transaction
 */
async function Close(close) {
    const list = close.list;
    if (list.state !== 'FOR_SALE') {
        throw new Error('The tree is not FOR SALE.');
    }
    list.state = 'RESERVE_NOT_MET';
    let highestOffer = null;
    let buyer = null;
    let seller = null;
    let price = null;
    if (list.offers && list.offers.length > 0) {
        list.offers.sort(function(a, b) {
            return (b.price - a.price);
        });
        highestOffer = list.offers[0];
        if (highestOffer.price >= list.reservePrice) {
            list.state = 'SOLD';
            buyer = highestOffer.buyer;
            seller = list.tree.owner;
            price = highestOffer.price;
            console.log('#### seller balance before: ' + seller.balance);
            seller.balance += price;
            console.log('#### seller balance after: ' + seller.balance);
            console.log('#### buyer balance before: ' + buyer.balance);
            buyer.balance -= price;
            console.log('#### buyer balance after: ' + buyer.balance);
            list.tree.owner = buyer;
            list.offers = null;
        }
    }

    if (highestOffer) {
        const treeRegistry = await getAssetRegistry('org.example.mynetwork.Commodity');
        await treeRegistry.update(list.tree);
    }

    const treeListRegistry = await getAssetRegistry('org.example.mynetwork.TreeList');
    await treeListRegistry.update(list);

    if (list.state === 'SOLD') {
        const buyerRegistry = await getParticipantRegistry('org.example.mynetwork.Buyer');
        await buyerRegistry.update(buyer);
        const sellerRegistry = await getParticipantRegistry('org.example.mynetwork.Seller');
        await sellerRegistry.update(seller);  
    }
}

/**
 * @param {org.example.mynetwork.Offer} Offer - the Offer transaction
 * @transaction
 */
async function Offer(offer) {
    let list = offer.list;
    if (list.state !== 'FOR_SALE') {
        throw new Error('The tree is not FOR SALE.');
    }
    if (!list.offers) {
        list.offers = [];
    }
    list.offers.push(offer);

    const treeListRegistry = await getAssetRegistry('org.example.mynetwork.TreeList');
    await treeListRegistry.update(list);
}