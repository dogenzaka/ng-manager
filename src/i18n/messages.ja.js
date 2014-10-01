angular
.module('ngManager')
.config(function($translateLoaderProvider) {

  console.info('i18n: ja');

  $translateLoaderProvider.translations('ja', {
    // Words
    Add: '追加',
    Cancel: 'キャンセル',
    Create: '作成',
    Endpoints: 'エンドポイント',
    Entities: 'データ',
    Name: '名前',
    Update: '更新',
    Modify: '編集',
    Remove: '削除',
    Search: '検索',
    Settings: '設定',
    Submit: '送信',
    Top: 'トップ',
    // Labels
    name: 'Name',
    url: 'URL',
    // Sentences
    'Add the endpoint': 'エンドポイント追加'
  });

})
;

