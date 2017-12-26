-- https://auth0.com/blog/creating-your-first-elm-app-part-1/
-- elm-make Main.elm --output ../public/elm.js

module CustomerOrders exposing (Partner)

import Html exposing (div, text, tr, td, th)
import Html.Attributes exposing (class)
import Html.Events exposing (onInput, onClick)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import Utils.Date
import Date exposing (Date)
import FormatNumber exposing (format)
import FormatNumber.Locales exposing (Locale)

type alias Model =
  { customerOrders : List CustomerOrder
  , filter : String
  , newCustomerOrderOpened : Bool
  , newCustomerOrder : NewCustomerOrder
  , authToken : String
  , page : Int
  , lastPage : Bool
  , partnerConf : PartnerConfig
  }
type alias Flags = {
  authToken : String
}
type alias Partner =
  { id : String
  , name : String
  }
type alias PartnerConfig =
  { query : String 
  , partners : List Partner
  , editing : Bool
  }
type alias NewCustomerOrder =
  { title : String 
  , description : String
  , partner : Partner
  , requestOriginal : String
  }
type alias CustomerOrder =
  { id : String
  , number : String 
  , total : Float
  , status : String
  , title : String
  , transportation : String
  , date : Date
  , partner : Partner
  , canEdit : Bool
  , canDestroy : Bool
  }

type Msg = FetchCustomerOrders Int String
  | FetchedCustomerOrders (Result Http.Error (List CustomerOrder))
  | ChangeFilter String
  | FlipNewCustomerOrder
  | FlipEditingPartner
  | ChangeNewCustomerOrderTitle String
  | ChangeNewCustomerOrderDescription String
  | ChangeNewCustomerOrderRequestOriginal String
  | CreateCustomerOrder
  | CreatedCustomerOrder (Result Http.Error CustomerOrder)
  | LoadMoreCustomerOrders
  | RefreshCustomerOrders
  | DestroyCustomerOrder String
  | DestroyedCustomerOrder String (Result Http.Error () )
  | FilterKeyPressed Int
  | ChangePartnerFilter String
  | FetchedPartners (Result Http.Error (List Partner))
  | ChoosePartner Partner


rusLocale : Locale
rusLocale =
  Locale 2 " " "," "" ""

update : Msg -> Model -> ( Model, Cmd Msg ) 
update msg m =
  let
    setTitle : String -> NewCustomerOrder -> NewCustomerOrder
    setTitle str nco =
      { nco | title = str }

    setDescription : String -> NewCustomerOrder -> NewCustomerOrder
    setDescription str nco =
      { nco | description = str }

    setRequestOriginal : String -> NewCustomerOrder -> NewCustomerOrder
    setRequestOriginal str nco =
      { nco | requestOriginal = str }

    setPartner : Partner -> NewCustomerOrder -> NewCustomerOrder
    setPartner p nco =
      { nco | partner = p }

    isLastPage : List CustomerOrder -> Bool
    isLastPage xs = (List.length xs) < 25

    setPartnerFilter : String -> PartnerConfig -> PartnerConfig
    setPartnerFilter str pc = 
      { pc | query = str }

    setPartnerList : List Partner -> PartnerConfig -> PartnerConfig
    setPartnerList lst pc =
      { pc | partners = lst }

    flipPartnerConf : PartnerConfig -> PartnerConfig
    flipPartnerConf pc =
      { pc | editing = not pc.editing }
  in
      
  case msg of
    FetchCustomerOrders p f ->
      ( { m | page = (m.page + 1) }, fetchCustomerOrders p f)

    FetchedCustomerOrders (Result.Ok xs) ->
      ( { m | customerOrders = List.append m.customerOrders xs, lastPage = isLastPage xs }, Cmd.none)
    
    FetchedCustomerOrders (Result.Err _) ->
      (m, Cmd.none)

    ChangeFilter str ->
      ( { m | filter = str }, Cmd.none)

    FlipNewCustomerOrder ->
      ( { m | newCustomerOrderOpened = not m.newCustomerOrderOpened }, Cmd.none)

    FlipEditingPartner ->
      ( { m | partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )

    ChangeNewCustomerOrderTitle x ->
      ( { m | newCustomerOrder = (setTitle x m.newCustomerOrder) }, Cmd.none )

    ChangeNewCustomerOrderDescription x ->
      ( { m | newCustomerOrder = (setDescription x m.newCustomerOrder) }, Cmd.none )

    ChangeNewCustomerOrderRequestOriginal x ->
      ( { m | newCustomerOrder = (setRequestOriginal x m.newCustomerOrder) }, Cmd.none )

    CreateCustomerOrder ->
      ( m, createCustomerOrder m )   

    CreatedCustomerOrder (Result.Err err) ->
      case err of
        Http.BadPayload y z ->
          Debug.log ("Http.BadPayload " ++ y)
          ( m, Cmd.none )
        _ ->
          ( m, Cmd.none )

    CreatedCustomerOrder (Result.Ok x) ->
      ( { m | customerOrders = [], page = 1 }, fetchCustomerOrders 1 m.filter )

    LoadMoreCustomerOrders ->
      if m.lastPage then
        ( m, Cmd.none )
      else
        ( { m | page = (m.page + 1) } , fetchCustomerOrders (m.page + 1) m.filter )

    RefreshCustomerOrders ->
      ( { m | customerOrders = [], page = 1 }, fetchCustomerOrders 1 m.filter)
    
    DestroyCustomerOrder customerOrderId ->
      ( m , (destroyCustomerOrder m customerOrderId) )
    
    DestroyedCustomerOrder customerOrderId (Result.Ok y) ->
      let
        filterOut : List CustomerOrder -> List CustomerOrder
        filterOut cos = List.filter (\co -> co.id /= customerOrderId ) cos
      in
      ( { m | customerOrders = filterOut m.customerOrders } , Cmd.none )
    
    DestroyedCustomerOrder _ (Result.Err _) ->
      ( m, Cmd.none )
    
    FilterKeyPressed keyCode ->
      if keyCode == 13 then
        ( { m | customerOrders = [], page = 1 }, fetchCustomerOrders 1 m.filter)
      else
        ( m, Cmd.none )

    ChangePartnerFilter str ->
      (
        { m | partnerConf = (setPartnerFilter str m.partnerConf) }
        , if String.length str >= 2 then
          fetchPartners str
        else
          Cmd.none
      )

    FetchedPartners (Result.Ok partners) ->
      ( {m | partnerConf = (setPartnerList partners m.partnerConf) }, Cmd.none )


    FetchedPartners (Result.Err err) ->
      case err of
        Http.BadPayload y z ->
          Debug.log ("Http.BadPayload " ++ y)
          ( m, Cmd.none )
        _ ->
          ( m, Cmd.none )

    ChoosePartner partner ->
      ( { m | newCustomerOrder = setPartner partner m.newCustomerOrder, partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )

destroyCustomerOrder : Model -> String -> Cmd Msg
destroyCustomerOrder m customerOrderId =
  Http.request {
    method = "DELETE"
    , headers = [
      Http.header "Authorization" ("Bearer " ++ m.authToken)
    ]
    , url = "http://localhost:3000/api/customer_orders/" ++ customerOrderId
    , body = Http.emptyBody
    , expect = Http.expectStringResponse (\_ -> Ok ())
    , timeout = Nothing
    , withCredentials = True
  } |> Http.send (DestroyedCustomerOrder customerOrderId)


createCustomerOrder : Model -> Cmd Msg
createCustomerOrder m =
  let
    nco = m.newCustomerOrder
  in
  Http.request {
    method = "POST"
    , headers = [
      Http.header "Authorization" ("Bearer " ++ m.authToken)
    ]
    , url = "http://localhost:3000/api/customer_orders"
    , body = Http.jsonBody (encodeCustomerOrder nco)
    , expect = Http.expectJson customerOrderDecoder
    , timeout = Nothing
    , withCredentials = True
    } |> Http.send CreatedCustomerOrder


encodeCustomerOrder : NewCustomerOrder -> Json.Encode.Value
encodeCustomerOrder no =
  Json.Encode.object [
    ("title", Json.Encode.string no.title),
    ("description", Json.Encode.string no.description),
    ("request_original", Json.Encode.string no.requestOriginal),
    ("partner_id", Json.Encode.string no.partner.id )
  ]


customerOrdersDecoder : Decode.Decoder (List CustomerOrder)
customerOrdersDecoder =
  Decode.list customerOrderDecoder


partnerDecoder : Decode.Decoder Partner
partnerDecoder =
  Decode.succeed Partner
    |> required "id" string
    |> required "name" string


customerOrderDecoder : Decode.Decoder CustomerOrder
customerOrderDecoder =
  Decode.succeed CustomerOrder
    |> required "id" string
    |> required "number" string
    |> required "total" float
    |> required "status" string
    |> required "title" string
    |> required "transportation" string
    |> required "date" Utils.Date.decoder
    |> required "partner" partnerDecoder
    |> required "can_edit" bool
    |> required "can_destroy" bool


fetchCustomerOrders : Int -> String -> Cmd Msg
fetchCustomerOrders p f =
  let
    queryString =
      "?q=" ++ f ++ "&page=" ++ (toString p)
    endpoint =
      "http://localhost:3000/api/customer_orders" ++ queryString
  in
  Http.send FetchedCustomerOrders (Http.get endpoint customerOrdersDecoder)


fetchPartners : String -> Cmd Msg
fetchPartners f = 
  let
    endpoint = ("http://localhost:3000/api/partners?q=" ++ f)
  in
  Http.send FetchedPartners (Http.get endpoint (Decode.list partnerDecoder))


initPartnerConf : PartnerConfig
initPartnerConf =
  PartnerConfig "" [] False

initPartner : Partner
initPartner = Partner "" ""


initNewCustomerOrder : NewCustomerOrder
initNewCustomerOrder =
  NewCustomerOrder "" "" initPartner ""


initModel : String -> Model
initModel authToken =
  Model [] "" False initNewCustomerOrder authToken 1 False initPartnerConf


init : Flags -> ( Model, Cmd Msg )
init flags =
  ( initModel flags.authToken, fetchCustomerOrders 1 "" )


subscriptions : Model -> Sub Msg
subscriptions model = Sub.none


view : Model -> Html.Html Msg
view m =
  div [ Html.Attributes.id "content" ] [
    Html.h1 [ class "page-title txt-color-blueDark ng-binding" ] [
      Html.i [ class "fa-fw fa fa-book" ] [],
      text "Заказы клиентов"
    ],
    div [ class "well well-white" ] [
      Html.node "form-nav-buttons" [] [
        div [ class "btn-group" ] [
          div [
            class "btn btn-success",
            onClick FlipNewCustomerOrder
          ] [
            Html.i [ class "fa fa-plus" ] [],
            text "Новый"
          ],
          div [
            class "btn btn-success",
            onClick RefreshCustomerOrders
          ] [
            Html.i [
              class "fa fa-refresh"
            ] [],
            text "Обновить"
          ]
        ]
      ],
      (if m.newCustomerOrderOpened then
        viewNewCustomerOrder m
      else
        viewQueryFilter m)
    ],
    div [ class "well well-white" ] [
      Html.table [ class "table table-bordered" ] [
        Html.thead [ class "hidden-xs" ] [
          tr [] [
            th [ class "hidden-xs" ] [
              Html.i [ class "fa fa-truck" ] []
            ], 
            th [] [ text "Номер" ],
            th [] [ text "Свой номер" ],
            th [ class "hidden-xs" ] [ text "Статус" ],
            th [] [ text "Дата" ],
            th [] [ text "Партнер" ],
            th [] [ text "Итого" ],
            th [] []
          ]
        ],
        Html.tbody [] (List.map viewCustomerOrder m.customerOrders)
      ],
      viewLoadMore m
    ]
  ]


viewLoadMore : Model -> Html.Html Msg
viewLoadMore m =
  if m.lastPage then
    Html.span [] []
  else
    div [
      onClick LoadMoreCustomerOrders,
      Html.Attributes.style [("width", "100%"), ("text-align", "center")]
    ] [
      Html.span [class "editable-click a.editable-click"] [
        text "Загрузить ещё"
      ]
    ]


onEnter : Msg -> Html.Attribute Msg
onEnter message =
  Html.Events.on "keydown" (Decode.succeed RefreshCustomerOrders)

onKeyUp : (Int -> Msg) -> Html.Attribute Msg
onKeyUp tagger =
  Html.Events.on "keyup" (Decode.map tagger Html.Events.keyCode)


viewQueryFilter : Model -> Html.Html Msg
viewQueryFilter m =
  Html.span [] [
    Html.hr [] [],
    div [ class "smart-form col-xs-12 col-md-6 col-lg-5 no-padding" ] [
      Html.node "section" [] [
        Html.label [ class "label"] [
          text "Запрос"
        ],
        Html.label [ class "input"] [
          Html.input [
            Html.Attributes.type_ "text",
            Html.Attributes.placeholder "Введите часть номера",
            class "input-sm ng-pristine ng-valid ng-empty ng-touched",
            Html.Events.onInput ChangeFilter,
            onKeyUp FilterKeyPressed
          ] []
        ]
      ]
    ],
    Html.button [
      class "btn btn-primary un-float margin-bottom-10",
      onClick RefreshCustomerOrders
    ] [
      Html.i [ class "fa fa-search" ] [],
      text "Поиск"
    ]
  ]


viewPartnerOption : Partner -> Html.Html Msg
viewPartnerOption p =
  div [
    class "col-md-2"
  ] [
    Html.span [ onClick (ChoosePartner p), class "editable-click" ] [ String.left 20 p.name |> text ]
  ]


--viewPartnerEditing : Model -> Html.Html Msg
--viewPartnerEditing m =

viewPartnerSection : Model -> Html.Html Msg
viewPartnerSection m =
  Html.section [ class "form-group", Html.Attributes.style [("overflow-y", "auto")] ] [
    Html.label [ class "control-label" ] [ text "Партнёр" ],
    Html.br [] [],
    if m.partnerConf.editing then
      Html.span [] [
        Html.input [
          class "input-sm form-control",
          onInput ChangePartnerFilter,
          Html.Attributes.placeholder "Введите ИНН или префикс"
        ] [
          text m.newCustomerOrder.partner.name
        ],
        Html.span [ ] (List.map viewPartnerOption m.partnerConf.partners )
      ]
    else
      Html.span [ onClick FlipEditingPartner, class "editable-click" ] [
        if String.length m.newCustomerOrder.partner.name == 0 then
          "Изменить" |> text
        else 
          m.newCustomerOrder.partner.name |> text
      ]
  ]


viewNewCustomerOrder : Model -> Html.Html Msg
viewNewCustomerOrder m =
  if m.newCustomerOrderOpened then
    Html.span [] [
      Html.h4 [] [
        text "Создать новый заказ"
      ],
      Html.section [ class "form-group" ] [
        Html.label [ class "control-label" ] [ text "Свой номер" ],
        Html.input [
          class "input-sm form-control",
          onInput ChangeNewCustomerOrderTitle
        ] [
          text m.newCustomerOrder.title
        ]
      ],
      Html.section [ class "form-group" ] [
        Html.label [ class "control-label" ] [ text "Описание" ],
        Html.input [
          class "input-sm form-control",
          onInput ChangeNewCustomerOrderDescription
        ] [
          text m.newCustomerOrder.description
        ]
      ],
      viewPartnerSection m,
      Html.section [ class "form-group" ] [
        Html.label [ class "control-label" ] [ text "Оригинал заявки" ],
        Html.textarea [
          class "input-sm form-control",
          onInput ChangeNewCustomerOrderDescription
        ] [
          text m.newCustomerOrder.requestOriginal
        ]
      ],
      Html.button [
        class "btn btn-default",
        onClick FlipNewCustomerOrder
      ] [
        text "Отмена"
      ],
      Html.button [
        class "btn btn-primary",
        onClick CreateCustomerOrder
      ] [
        text "Сохранить"
      ]
    ]
  else
    text ""


viewCustomerOrder : CustomerOrder -> Html.Html Msg
viewCustomerOrder co =
  let
    trashAttrsDefault : List (Html.Attribute Msg)
    trashAttrsDefault = 
      [
        class "btn btn-xs btn-danger"
        , onClick (DestroyCustomerOrder co.id)
      ]

    trashAttrs : List (Html.Attribute Msg)
    trashAttrs =
      if co.canDestroy then
        trashAttrsDefault
      else
        (Html.Attributes.attribute "disabled" "true") :: trashAttrsDefault
  in
  tr [] [
    td [ class "hidden-xs" ] [ String.left 1 (co.transportation) |> text ],
    td [] [ text co.number ],
    td [] [ text co.title ],
    td [ class "hidden-xs" ] [ text co.status ],
    td [] [ Utils.Date.toHuman co.date |> text ],
    td [] [ text co.partner.name ],
    td [ class "text-right" ] [ format rusLocale co.total |> (flip (++) " руб") |> text ],
    td [ class "center-item-text" ] [
      Html.node "form-nav-buttons" [ class "btn-group" ] [
        Html.a [ class "btn btn-xs btn-info", Html.Attributes.href ("/#/customer_orders/" ++ co.id)] [
          Html.i [ class "fa fa-eye" ] []
        ],
        div trashAttrs [
          Html.i [ class "fa fa-trash-o" ] []
        ]
      ]
    ]
  ]


-- MAIN
main : Program Flags Model Msg
main =
  Html.programWithFlags
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }