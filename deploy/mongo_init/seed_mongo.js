print('===============JAVASCRIPT===============');
print('Count of rows in test collection: ' + db.blockchain.count());

db.test_table.insert({ myfield: 'test1', anotherfield: 'TEST1' });