angular
.module('ngManager')
.config(function($translateLoaderProvider) {

  $translateLoaderProvider.translations('ja', {
    // Words
    Add: '追加',
    Cancel: 'キャンセル',
    Close: '閉じる',
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
    name: '名前',
    url: 'URL',
    // Sentences
    'Add the endpoint': 'エンドポイント追加',

    'Entity configuration not found for {{kind}}': '{{kind}}のデータ設定が見つかりません'
  });

})
;

