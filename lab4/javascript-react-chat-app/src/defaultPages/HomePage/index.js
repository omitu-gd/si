import React from "react";
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/core";

import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { wrapperStyle, titleStyle, subTitleStyle, componentStyle, boxStyle, titleWrapperStyle, thumbnailWrapperStyle, componentTitleStyle, UIComponentStyle, descWrapperStyle, linkWrapperStyle, linkStyle, logoutBtn } from "./style";

import * as actions from "../../store/action";

import CometChatUI from "./resources/CometChatUI.png";
import Component from "./resources/components.png";
import listComponent from "./resources/wall.png";

class HomePage extends React.Component {
	render() {
		let authRedirect = null;
		if (!this.props.isLoggedIn) {
			authRedirect = <Redirect to="/login" />;
		}

		return (
			<div css={wrapperStyle()}>
				{authRedirect}
				<p css={titleStyle()}>The UI Kit has different ways to make fully customizable UI required to build a chat application.</p>
				<p css={subTitleStyle()}>The UI Kit has been developed to help developers of different levels of experience to build a chat application in a few minutes to a couple of hours.</p>

				<div css={UIComponentStyle()}>
					<div css={boxStyle()}>
						<div css={titleWrapperStyle()}>
							<div css={thumbnailWrapperStyle}>
								<img src={CometChatUI} alt="CometChatUI" />
							</div>
							<h2 css={componentTitleStyle()}>CometChatUI</h2>
						</div>
						<div css={descWrapperStyle()}>
							<p>
								The <code>CometChatUI</code> component launches a fully working chat application.
							</p>
						</div>
						<ul css={linkWrapperStyle()}>
							<li>
								<Link css={linkStyle()} to="/embedded-app">
									Launch
								</Link>
							</li>
						</ul>
					</div>
				</div>
				
				<div css={logoutBtn()}>
					<button type="button" onClick={this.props.onLogout}>
						Logout
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		loading: state.loading,
		error: state.error,
		isLoggedIn: state.isLoggedIn,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		onLogout: () => dispatch(actions.logout()),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
