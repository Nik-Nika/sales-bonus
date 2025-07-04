/**
 * Функция для расчета прибыли
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    // @TODO: Расчет прибыли от операции
    discount =  1 - (purchase.discount / 100);
    return purchase.sale_price * purchase.quantity * discount;
}
/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
    if (index === 0) {
    return profit*0.15;
    } else if (index === 1 || index === 2) {
        return profit*0.1;
    } else if (index == total-1) {
        return 0;
    } else { // Для всех остальных
        return profit*0.05;;
    } 
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data
        || data.sellers.length === 0 || data.customers.length === 0
        || data.products.length === 0 || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    } 
    
    const { calculateRevenue, calculateBonus } = options;
    
    // @TODO: Проверка наличия опций
    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Чего-то не хватает');
    } 
        
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    })); 


    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = sellerStats.reduce((result, item) => ({
        ...result,
        [item.id]: item
    }), {});

    const productIndex = data.products.reduce((result, item) => ({
        ...result,
        [item.sku]: item
    }), {});  
    // @TODO: Расчет выручки и прибыли для каждого продавца

    data.purchase_records.forEach(record => { // Чек 
        const seller = sellerIndex[record.seller_id]; // Продавец
        seller.sales_count = seller.sales_count + 1;// Увеличить количество продаж 
        seller.revenue = seller.revenue + record.total_amount;// Увеличить общую сумму всех продаж

        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            const cost = product.purchase_price * item.quantity;// Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            const revenue = calculateRevenue(item);// Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            // item?
            // item?
            // item?
            // item?
            // item?
            const profit = revenue - cost;// Посчитать прибыль: выручка минус себестоимость
            seller.profit = seller.profit + profit;
        // Увеличить общую накопленную прибыль (profit) у продавца  

            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            // По артикулу товара увеличить его проданное количество у продавца
            seller.products_sold[item.sku] = seller.products_sold[item.sku] + item.quantity;
        });
    });

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a,b) => b.profit - a.profit); 
    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller);// Считаем бонус
        let soldProducts = Object.entries(seller.products_sold).map(([sku, quantity]) => ({ sku, quantity })).sort((a,b) => b.quantity - a.quantity);

        if (soldProducts.length > 10) {
            soldProducts = soldProducts.slice(0,10)
        };

        seller.top_products = soldProducts;// Формируем топ-10 товаров
    }); 
    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
        seller_id: seller.id,// Строка, идентификатор продавца
        name: seller.name,// Строка, имя продавца
        revenue: +seller.revenue.toFixed(2),// Число с двумя знаками после точки, выручка продавца
        profit: +seller.profit.toFixed(2),// Число с двумя знаками после точки, прибыль продавца
        sales_count: seller.sales_count, // Целое число, количество продаж продавца
        top_products: seller.top_products,// Целое число, топ-10 товаров продавца
        bonus: +seller.bonus.toFixed(2) // Число с двумя знаками после точки, бонус продавца
    })); 
}

