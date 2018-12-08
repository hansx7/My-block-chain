/**
 * @param {org.example.mynetwork.Close} Close - the Close transaction
 * @transaction
 */
async function Close(close) {
    const list = close.list;  //获取要close的列表
    if (list.state !== 'FOR_SALE') {  //如果不是正在出售的树则报错
        throw new Error('The tree is not FOR SALE.');
    }
    list.state = 'RESERVE_NOT_MET';  //先改成“没有达到要求”，后面再判断
    let highestOffer = null;
    let buyer = null;
    let seller = null;
    let price = null;
    if (list.offers && list.offers.length > 0) {  //如果报价数组不为空
        list.offers.sort(function(a, b) {  //排序数组
            return (b.price - a.price);
        });
        highestOffer = list.offers[0];  //取出最高价
        if (highestOffer.price >= list.reservePrice) {  //如果最高价满足了要求
            list.state = 'SOLD';  //修改树的状态
            buyer = highestOffer.buyer;
            seller = list.tree.owner;
            price = highestOffer.price;  //金钱转账
            seller.balance += price;
            buyer.balance -= price;
            list.tree.owner = buyer;  //树的归属权交接
            list.offers = null;
        }
    }

    if (highestOffer) {  //下面都是根据不同的close结果来发通知
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
    list.offers.push(offer);  //将新的报价添加到列表的报价数组中

    const treeListRegistry = await getAssetRegistry('org.example.mynetwork.TreeList');
    await treeListRegistry.update(list);
}
