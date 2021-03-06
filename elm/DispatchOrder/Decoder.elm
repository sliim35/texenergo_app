module DispatchOrder.Decoder
    exposing
        ( dispatchOrderDecoder
        )

import DispatchOrder.Model exposing (DispatchOrderId(..), DispatchOrder)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Utils.Date


dispatchOrderDecoder : Decode.Decoder DispatchOrder
dispatchOrderDecoder =
    Decode.succeed DispatchOrder
        |> required "id" (string |> Decode.map DispatchOrderId)
        |> required "date" Utils.Date.decoder
        |> required "number" string
        |> required "total" float
        |> required "partner_id" string
