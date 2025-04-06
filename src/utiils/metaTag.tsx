import React from "react";
import { Helmet } from "react-helmet-async";

export type metaProps = {
    title: string,
    description: string,
    url: string
}

export default function metaTag(props : metaProps): React.ReactElement {
    return (
        <Helmet>
            <title>{props.title}</title>
            
            <meta name="description" content={props.description} />
            <meta name="keywords" content='' /> //설명 추가

            <meta property="og:type" content="website" />


            <meta property="og:title" content={props.title} />
            <meta property="og:site_name" content={props.title} />
            <meta property="og:description" content={props.description} />
            <meta property="og:image" content='/adimage.png' />
            <meta property="og:url" content={props.url} />
            <meta property='og:locale' content='ko_KR'/>

            <meta name="twitter:title" content={props.title} />
            <meta name="twitter:description" content={props.description} />
            <meta name="twitter:image" content='/adimage.png' />

            <link rel="canonical" href={props.url} />
        </Helmet>
    )
}